```ts
import * as THREE from "three";
import { createBuilder, catmull, grain, paint, spiral, spots } from "agentic-3js-builder";

export const meta = {
  name: "seahorse",
  description:
    "A sunny yellow seahorse with dark ridge lines and white freckles, its curled tail wrapped around a strand of seagrass.",
};

/** Piecewise-linear ramp over the swept range t in [0, 1]. */
function ramp(stops: [number, number][]): (t: number) => number {
  return (t: number) => {
    for (let i = 0; i < stops.length - 1; i++) {
      const [t0, v0] = stops[i];
      const [t1, v1] = stops[i + 1];
      if (t <= t1) return v0 + ((t - t0) / (t1 - t0)) * (v1 - v0);
    }
    return stops[stops.length - 1][1];
  };
}

export default function build(): THREE.Object3D {
  // palette
  const SUN = "#ffc21a";
  const SUN_DEEP = "#eaa515";
  const LINE = "#3d2a14";
  const WHITE = "#fbf9ee";
  const PUPIL = "#15171c";
  const FIN = "#bff2e8";
  const GRASS = "#2a8a48";
  const GRASS_LIGHT = "#72c875";

  // paints
  const freckles = spots(SUN, WHITE, { size: 0.022, amount: 0.1, seed: 7 });
  const ringed = (lines: number, width: number) =>
    paint((_p, _n, s) => (Math.abs(((s[0] * lines) % 1) - 0.5) < width ? LINE : freckles));
  const seagrass = grain(GRASS_LIGHT, GRASS, { size: 0.008 });

  const b = createBuilder({ name: "seahorse" });

  // ---- skeleton ------------------------------------------------------------
  const STEM_X = 0.022; // the seagrass stem stands just left of the midline
  const HIP: [number, number, number] = [0, 0.15, 0.035];
  const hips = b.joint("hips", { at: HIP, role: "spine" });

  // trunk: a chain from the hips up to a neck tip
  const spine = b.chain(
    "spine",
    catmull([HIP, [0, 0.18, 0.045], [0, 0.215, 0.05], [0, 0.255, 0.06]]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "neck"], role: "spine" },
  );

  // tail: a coil around the seagrass stem
  const tail = b.chain(
    "tail",
    spiral([STEM_X, 0.15, 0], HIP, [0, 1, 0], { turns: 1.4, r1: 0.022, pitch: -0.035 }),
    { parent: hips, count: 8, role: "tail" },
  );

  // head and jaw
  const head = b.joint("head", { parent: spine, at: [0, 0.255, 0.06], aim: [0, 0.29, 0.13], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.262, 0.108], aim: [0, 0.255, 0.185], role: "jaw" });

  // grass root (scenery that rides its own joint)
  const grass = b.joint("grass", { parent: hips, at: [0, 0, 0] });

  // ---- body ----------------------------------------------------------------
  // boxy, bony trunk
  const trunkR = (t: number): [number, number] => {
    const k = Math.sin(Math.PI * t) ** 0.6;
    return [0.017 + 0.012 * k, 0.019 + 0.014 * k];
  };
  const trunk = b.sweep(spine, trunkR, { section: "box", color: ringed(9, 0.07) });

  // raised bony rings on the trunk
  const body = b.surface(trunk);
  for (let k = 1; k < 9; k++) {
    const ridge = body.loop(trunk.at(k / 9).at, { dir: [0, 1, 0], lift: 0.001 });
    b.sweep(ridge, 0.0042, { color: SUN_DEEP });
  }

  // curled, ringed tail
  b.sweep(tail, (t: number) => 0.0135 - 0.0085 * t, { color: ringed(11, 0.08) });

  // head: cranium tapering into a long tube snout
  const skullRx = ramp([[0, 0.02], [0.25, 0.027], [0.45, 0.02], [0.74, 0.014], [1, 0.008]]);
  const skullRy = ramp([[0, 0.022], [0.25, 0.03], [0.45, 0.022], [0.74, 0.014], [1, 0.008]]);
  const skull = b.sweep(
    catmull([[0, 0.27, 0.05], [0, 0.288, 0.085], [0, 0.282, 0.115], [0, 0.276, 0.16], [0, 0.272, 0.2]]),
    (t: number): [number, number] => [skullRx(t), skullRy(t)],
    { bone: head, color: freckles },
  );

  // lower jaw, hinged on the jaw joint
  b.sweep(catmull([[0, 0.262, 0.108], [0, 0.257, 0.15], [0, 0.255, 0.185]]), [0.006, 0.0045], {
    bone: jaw,
    color: SUN,
  });

  // little crown of spikes across the back of the skull
  const crownSurface = b.surface(skull);
  const crown: [number, number][] = [
    [140, 46],
    [160, 54],
    [180, 62],
    [200, 54],
    [220, 46],
  ];
  for (const [az, el] of crown) {
    const hit = crownSurface.around([0, 0.29, 0.075]).at(az, el);
    if (hit) b.spike(hit, hit, 0.03, 0.0065, { color: SUN_DEEP });
  }

  // big, curious eyes with glossy pupils
  for (const s of [1, -1]) {
    const eye: [number, number, number] = [s * 0.024, 0.296, 0.085];
    b.part(new THREE.SphereGeometry(0.017, 12, 9), WHITE, { at: eye, bone: head });
    const pupil: [number, number, number] = [eye[0] + s * 0.0095, eye[1] + 0.002, eye[2] + 0.0095];
    b.part(new THREE.SphereGeometry(0.0095, 10, 8), PUPIL, { at: pupil, bone: head });
    b.part(new THREE.SphereGeometry(0.0027, 6, 4), WHITE, {
      at: [pupil[0] + s * 0.004, pupil[1] + 0.004, pupil[2] + 0.005],
      bone: head,
    });
  }

  // delicate fluttering dorsal fin, a membrane from the trunk's back line
  b.membrane(
    trunk.line(0, 0.002).slice(0.12, 0.7),
    catmull([
      [0, 0.176, -0.012],
      [0, 0.19, -0.04],
      [0, 0.205, -0.062],
      [0, 0.222, -0.076],
      [0, 0.238, -0.064],
      [0, 0.252, -0.038],
      [0, 0.262, -0.016],
    ]),
    { color: FIN, thickness: 0.0018, bone: spine },
  );

  // ---- seagrass ------------------------------------------------------------
  // stem rising from the floor
  b.sweep(
    catmull([
      [STEM_X, 0, 0],
      [0.024, 0.1, 0],
      [STEM_X, 0.2, 0],
      [0.012, 0.3, -0.002],
      [0, 0.42, -0.004],
    ]),
    (t: number) => 0.0075 - 0.0028 * t,
    { bone: grass, color: GRASS, caps: { start: "flat", end: "point" } },
  );

  // two twisting blades
  const bladeA = catmull([
    [STEM_X, 0.008, -0.005],
    [0, 0.06, -0.02],
    [-0.025, 0.16, -0.05],
    [-0.03, 0.28, -0.055],
    [-0.01, 0.4, -0.04],
  ]);
  b.sweep(bladeA, (t: number): [number, number] => [0.011 * (1 - t) ** 0.8 + 0.0008, 0.0016], {
    section: "box",
    bone: grass,
    color: seagrass,
    twist: 50,
    caps: { start: "flat", end: "point" },
  });

  const bladeB = catmull([
    [STEM_X, 0.008, -0.01],
    [0.035, 0.06, -0.035],
    [0.05, 0.16, -0.07],
    [0.052, 0.28, -0.075],
    [0.04, 0.4, -0.06],
  ]);
  b.sweep(bladeB, (t: number): [number, number] => [0.011 * (1 - t) ** 0.8 + 0.0008, 0.0016], {
    section: "box",
    bone: grass,
    color: seagrass,
    twist: -60,
    caps: { start: "flat", end: "point" },
  });

  return b.root;
}
```