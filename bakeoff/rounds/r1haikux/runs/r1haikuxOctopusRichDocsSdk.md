```ts
import * as THREE from "three";
import { createBuilder, catmull, spiral, rng, mottle, spots, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Reef octopus",
  description: "A curious reef octopus in coral and rust tones, golden bar-pupiled eyes, eight cream-suckered arms, one holding an old brass key.",
};

type P3 = [number, number, number];
type Curl = { dir: 1 | -1; turns: number; r: number };
type Path = ReturnType<typeof catmull>;

const CORAL = "#e2603f";
const RUST = "#9a3a20";
const PALE = "#f5c9a6";
const BELLY = "#f3d6b8";
const CREAM = "#f7ebd2";
const DEEP = "#6b2615";
const DARK = "#1f0f0b";
const GOLD = "#f2b53a";
const BRASS = "#c48d33";
const PATINA = "#5e8f7c";

// polar (radial distance, height, sideways offset) around the mantle axis, facing +Z at phi = 0
function polar(phi: number, r: number, y: number, side: number): P3 {
  const a = (phi * Math.PI) / 180;
  const s = Math.sin(a);
  const c = Math.cos(a);
  return [r * s + side * c, y, r * c - side * s];
}

// An arm: smooth run through its points, then an optional flat coil at the tip.
function armPath(phi: number, pts: P3[], curl: Curl | null): Path {
  const xyz: P3[] = pts.map(([r, y, side]) => polar(phi, r, y, side));
  let path: Path = catmull(xyz);
  if (curl) {
    const last = new THREE.Vector3(...xyz[xyz.length - 1]);
    const prev = new THREE.Vector3(...xyz[xyz.length - 2]);
    const T = last.clone().sub(prev);
    T.y = 0;
    T.normalize();
    const perp = new THREE.Vector3(-T.z, 0, T.x);
    const c = last.clone().addScaledVector(perp, -curl.dir * curl.r);
    const coil = spiral([c.x, c.y, c.z], [last.x, last.y, last.z], [0, 1, 0], {
      turns: curl.dir * curl.turns,
      r1: curl.r * 0.4,
      pitch: 0,
    });
    path = path.concat(coil);
  }
  return path;
}

export default function build() {
  const b = createBuilder({ name: "reef-octopus" });
  const body = b.joint("body", { at: [0, 0.2, 0], role: "spine" });

  // Paint: coral and rust mottling with pale blotches, paler belly.
  const coral = mottle(RUST, CORAL, { size: 0.1, contrast: 0.7, seed: 3 });
  const coat = countershade(mottle(coral, PALE, { size: 0.16, contrast: 0.55, seed: 5 }), BELLY, { level: -0.25 });
  const keyPaint = spots(BRASS, PATINA, { size: 0.025, amount: 0.2, seed: 4 });

  // Bulbous mantle, one rigid bone.
  const mantle = b.loft(
    [
      { at: [0, 0.12, 0], w: 0.16, h: 0.14 },
      { at: [0, 0.2, 0], w: 0.27, h: 0.25 },
      { at: [0, 0.29, 0.01], w: 0.34, h: 0.32 },
      { at: [0, 0.37, 0.02], w: 0.35, h: 0.33 },
      { at: [0, 0.44, 0.02], w: 0.27, h: 0.26 },
      { at: [0, 0.49, 0.02], w: 0.13, h: 0.12 },
    ],
    { bone: body, color: coat, detail: 1.2 },
  );

  const skin = b.surface(mantle);
  const hitAt = (az: number, el: number) => {
    const h = skin.around([0, 0.3, 0]).at(az, el);
    if (!h) throw new Error(`no mantle surface at az ${az}, el ${el}`);
    return h;
  };

  // Golden eyes with bar pupils.
  const eyeCentres: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    const eye = hitAt(s * 40, 2).moved([0, 0.035, 0]);
    eyeCentres.push(eye.at);
    b.part(new THREE.SphereGeometry(0.045, 12, 8), GOLD, { frame: eye, flat: true });
    const pupil = eye.moved([0, 0.038, 0]);
    b.part(new THREE.SphereGeometry(0.03, 12, 8).scale(1, 0.3, 0.4), DARK, { frame: pupil, flat: true });
  }

  // Grumpy brows: outer ends high, inner ends dropped into a frown.
  for (const s of [1, -1]) {
    const outer = hitAt(s * 60, 32).moved([0, 0.014, 0]);
    const inner = hitAt(s * 22, 23).moved([0, 0.014, 0]);
    b.capsule(outer, inner, [0.02, 0.013], { color: DEEP });
  }

  // Little bumps all over the mantle, kept off the eyes.
  for (const hit of skin.scatter(110, {
    rng: rng(21),
    minDist: 0.04,
    filter: (h) => h.n.y > -0.3 && eyeCentres.every((e) => h.at.distanceTo(e) > 0.1),
  })) {
    b.stick(new THREE.SphereGeometry(0.015, 6, 4), RUST, hit, { embed: 0.5, flat: true });
  }

  // Beak under the mantle.
  b.spike([0, 0.085, 0.03], [0, -1, 0.35], 0.03, 0.011, { color: DARK, bone: body });

  // The old brass key, held up by the front-left arm.
  const KX = 0.16;
  const KZ = 0.3;
  b.part(new THREE.TorusGeometry(0.03, 0.007, 6, 12), keyPaint, { at: [KX, 0.46, KZ], bone: body, flat: true });
  b.rod([KX, 0.43, KZ], [KX, 0.32, KZ], 0.0065, { color: keyPaint, bone: body });
  b.extrude(
    [
      [-0.006, 0],
      [0.024, 0],
      [0.024, 0.012],
      [0.016, 0.012],
      [0.016, 0.02],
      [0.024, 0.02],
      [0.024, 0.03],
      [-0.006, 0.03],
    ],
    { at: [KX, 0.315, KZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, color: keyPaint, bone: body },
  );

  // Arm grip: approaches from the front and coils round the key's shaft.
  const coilC: P3 = [KX, 0.37, KZ];
  const coilS: P3 = [KX + 0.022, 0.37, KZ];
  const holdPath: Path = catmull([[0.07, 0.1, 0.07], [0.13, 0.22, 0.2], [0.2, 0.31, 0.36], coilS]).concat(
    spiral(coilC, coilS, [0, 1, 0], { turns: 1.5, r1: 0.02, pitch: 0.05 }),
  );

  const armRadius = (t: number) => 0.048 - 0.034 * t;

  // One arm: tapered tube, two rows of cream suckers on the sides, small bumps on top.
  const addArm = (name: string, path: Path, count: number) => {
    const ch = b.chain(name, path, { parent: body, role: "tentacle", count });
    const sw = b.sweep(ch, armRadius, { color: coat, caps: { end: "point" } });
    for (let t = 0.05; t <= 0.95; t += 0.042) {
      const rr = Math.max(0.005, 0.3 * armRadius(t));
      for (const ang of [100, 260]) {
        b.stick(new THREE.CylinderGeometry(rr, rr * 0.82, 0.007, 7), CREAM, sw.at(t, ang), {
          embed: 0.35,
          flat: true,
        });
      }
    }
    for (let t = 0.09; t <= 0.93; t += 0.065) {
      b.stick(new THREE.SphereGeometry(0.0068, 5, 4), RUST, sw.at(t, 0), { embed: 0.5, flat: true });
    }
    return sw;
  };

  const ARMS: { name: string; phi: number; pts: P3[]; curl: Curl | null; count: number }[] = [
    {
      name: "armF",
      phi: 0,
      pts: [
        [0.07, 0.1, 0],
        [0.18, 0.058, 0.02],
        [0.3, 0.038, 0.05],
        [0.42, 0.034, 0.1],
      ],
      curl: { dir: 1, turns: 1.3, r: 0.075 },
      count: 10,
    },
    {
      name: "armL",
      phi: 90,
      pts: [
        [0.07, 0.1, 0],
        [0.19, 0.16, 0],
        [0.29, 0.24, -0.03],
        [0.35, 0.3, -0.06],
      ],
      curl: { dir: -1, turns: 1.2, r: 0.07 },
      count: 10,
    },
    {
      name: "armBL",
      phi: 135,
      pts: [
        [0.07, 0.1, 0],
        [0.21, 0.05, 0],
        [0.35, 0.03, 0.05],
        [0.46, 0.026, 0.1],
      ],
      curl: { dir: -1, turns: 1.0, r: 0.09 },
      count: 10,
    },
    {
      name: "armB",
      phi: 180,
      pts: [
        [0.07, 0.1, 0],
        [0.2, 0.045, 0.02],
        [0.34, 0.028, 0],
        [0.46, 0.02, -0.02],
        [0.52, 0.02, -0.03],
      ],
      curl: { dir: 1, turns: 1.0, r: 0.06 },
      count: 10,
    },
    {
      name: "armBR",
      phi: 225,
      pts: [
        [0.07, 0.1, 0],
        [0.21, 0.12, 0],
        [0.33, 0.16, 0.02],
      ],
      curl: { dir: 1, turns: 1.4, r: 0.07 },
      count: 10,
    },
    {
      name: "armR",
      phi: 270,
      pts: [
        [0.07, 0.1, 0],
        [0.21, 0.05, 0],
        [0.36, 0.03, -0.04],
        [0.45, 0.03, -0.12],
      ],
      curl: { dir: 1, turns: 1.2, r: 0.08 },
      count: 10,
    },
    {
      name: "armFR",
      phi: 315,
      pts: [
        [0.07, 0.1, 0],
        [0.19, 0.14, 0],
        [0.3, 0.2, -0.03],
        [0.36, 0.23, -0.06],
      ],
      curl: { dir: -1, turns: 1.3, r: 0.065 },
      count: 10,
    },
  ];

  for (const a of ARMS) addArm(a.name, armPath(a.phi, a.pts, a.curl), a.count);
  addArm("armKey", holdPath, 12);

  return b.root;
}
```