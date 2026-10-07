```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  spiral,
  frame,
  interpolate,
  stripes,
  spots,
  countershade,
  grain,
} from "agentic-3js-builder";

export const meta = {
  name: "Lined Seahorse",
  description:
    "A sunny-yellow lined seahorse with a crown of spikes, long tube snout, big curious eyes and a fluttering dorsal fin, tail curled around a strand of seagrass.",
};

export default function build() {
  const b = createBuilder({ name: "lined_seahorse" });

  // ---------- palette & paints ----------
  const DARK = "#4a2e10";
  const coat = spots(
    stripes(countershade("#f2b30a", "#ffd84a", { level: 0, soft: 0.5 }), DARK, {
      size: 0.0105,
      axis: "y",
      width: 0.13,
      wobble: 0.15,
      seed: 2,
    }),
    "#fffdf0",
    { size: 0.017, amount: 0.16, seed: 5 },
  );
  const snoutPaint = stripes("#f5c518", DARK, { size: 0.01, axis: "z", width: 0.12, wobble: 0.1, seed: 4 });
  const finPaint = stripes("#fff0b8", "#f0a63a", { size: 0.0042, axis: "y", width: 0.28, wobble: 0.05, seed: 7 });
  const grassPaint = grain("#3f9f48", "#7bd06a", { size: 0.004, axis: "y", seed: 3 });

  // ---------- skeleton ----------
  const pelvis = b.joint("pelvis", { at: [0, 0.11, -0.004], dir: [0, 1, 0] });

  const spinePath = catmull([
    [0, 0.11, -0.004],
    [0, 0.13, 0.004],
    [0, 0.155, 0.012],
    [0, 0.178, 0.008],
    [0, 0.196, -0.003],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: "pelvis",
    names: ["spine1", "spine2", "spine3", "neck"],
    up: [0, 0, 1],
    role: "spine",
  });

  const head = b.joint("head", { parent: spine, at: [0, 0.198, 0.0], dir: [0, -0.1, 1], up: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.1905, 0.05], dir: [0, -0.05, 1], role: "jaw" });

  // Tail: leaves the pelvis and spirals down around the grass strand.
  const GZ = -0.05;
  const tailPath = polyline([
    [0, 0.112, -0.003],
    [0, 0.097, -0.018],
  ]).concat(
    spiral([0, 0.097, GZ], [0, 0.097, -0.018], [0, -1, 0], { turns: 2.5, r1: 0.012, pitch: 0.028 }),
  );
  const tail = b.chain("tail", tailPath, { parent: "pelvis", count: 8, role: "tail" });

  // ---------- body ----------
  const bodyR = (t: number) => {
    const ry = interpolate([0, 0.25, 0.5, 0.75, 1], [0.013, 0.029, 0.029, 0.017, 0.012], t);
    return [ry * 0.8, ry] as const;
  };
  const body = b.sweep(spine, bodyR, { color: coat, sides: 10, smooth: false, caps: { start: "round", end: "round" } });

  const tailR = (t: number) => {
    const r = 0.0125 * Math.pow(1 - t, 0.8) + 0.0035;
    return [r, r * 0.9] as const;
  };
  b.sweep(tail, tailR, { color: coat, section: "box", caps: { start: "round", end: "round" } });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
    at: [0, 0.205, 0.01],
    scale: [0.015, 0.017, 0.021],
    bone: head,
    name: "skull",
  });
  // snout (upper jaw) and lower jaw
  b.rod([0, 0.203, 0.02], [0, 0.1935, 0.066], [0.0078, 0.0042], { color: snoutPaint, sides: 6, bone: head, name: "snout" });
  b.capsule([0, 0.1893, 0.056], [0, 0.1893, 0.067], { radius: 0.0021, color: "#d9892b", sides: 6, bone: jaw, name: "lowerJaw" });

  // eyes
  for (const s of [1, -1]) {
    const e: [number, number, number] = [s * 0.0115, 0.2105, 0.016];
    b.part(new THREE.SphereGeometry(0.0085, 10, 8), "#f0b429", { at: e, bone: head, name: s > 0 ? "eyeL" : "eyeR" });
    b.part(new THREE.SphereGeometry(0.0058, 10, 8), "#15110c", {
      at: [e[0] + s * 0.0035, e[1], e[2] + 0.0012],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.0016, 6, 5), "#ffffff", {
      at: [e[0] + s * 0.0081, e[1] + 0.0026, e[2] + 0.0035],
      bone: head,
    });
  }

  // crown of spikes
  const crownCone = new THREE.ConeGeometry(0.0028, 0.011, 5);
  b.ring(frame([0, 0.218, 0.01], [0, 1, 0]), { count: 5, radius: 0.008, fromDeg: 110, toDeg: 250, tilt: 25 }, (item) => {
    b.stick(crownCone, "#d98a10", item, { bone: head, embed: 0.15 });
  });
  b.stick(new THREE.ConeGeometry(0.0035, 0.016, 5), "#c97a0c", frame([0, 0.221, 0.002], [0, 1, -0.2]), {
    bone: head,
    embed: 0.15,
  });

  // ---------- ridges on the body ----------
  const surf = b.surface(body);
  const backSpike = new THREE.ConeGeometry(0.003, 0.009, 5);
  const sideBump = new THREE.SphereGeometry(0.0028, 6, 4);
  const bellyBump = new THREE.SphereGeometry(0.0024, 6, 4);
  for (let i = 0; i < 8; i++) {
    const y = 0.122 + i * 0.0085;
    const back = surf.ray([0, y, -0.3], [0, 0, 1]);
    if (back) b.stick(backSpike, "#d18a14", back, { scale: 1 - i * 0.04, embed: 0.2 });
    const belly = surf.ray([0, y + 0.004, 0.3], [0, 0, -1]);
    if (belly) b.stick(bellyBump, "#e39a1a", belly, { embed: 0.3 });
    const l = surf.ray([0.3, y + 0.004, 0.003], [-1, 0, 0]);
    if (l) b.stick(sideBump, "#ffe08a", l, { embed: 0.3 });
    const r = surf.ray([-0.3, y + 0.004, 0.003], [1, 0, 0]);
    if (r) b.stick(sideBump, "#ffe08a", r, { embed: 0.3 });
  }

  // ---------- dorsal fin ----------
  const edgeA: THREE.Vector3[] = [];
  const edgeB: THREE.Vector3[] = [];
  for (let i = 0; i < 7; i++) {
    const y = 0.126 + i * 0.0085;
    const h = surf.ray([0, y, -0.3], [0, 0, 1]);
    if (!h) continue;
    edgeA.push(h.at.clone().add(new THREE.Vector3(0, 0, 0.002)));
    edgeB.push(h.at.clone().add(new THREE.Vector3(0, 0.003, -0.02 - 0.005 * Math.sin(i * 1.5))));
  }
  b.membrane(edgeA, edgeB, {
    color: finPaint,
    thickness: 0.0008,
    rows: 3,
    cols: 12,
    scallop: 0.12,
    bone: spine,
    name: "dorsalFin",
  });

  // pectoral fins
  const finOutline: Array<[number, number]> = [
    [0, -0.003],
    [0.01, -0.01],
    [0.016, -0.002],
    [0.014, 0.007],
    [0.007, 0.011],
    [0, 0.003],
  ];
  for (const s of [1, -1]) {
    b.extrude(finOutline, {
      at: [s * 0.016, 0.17, 0.004],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.0008,
      smoothing: 1,
      color: finPaint,
      bone: "spine3",
      name: s > 0 ? "pectoralL" : "pectoralR",
    });
  }

  // ---------- seagrass & base ----------
  const grassPts: Array<[number, number, number]> = [
    [0, 0, GZ],
    [0.003, 0.1, GZ],
    [-0.004, 0.2, GZ],
    [0.006, 0.3, GZ - 0.002],
    [0.012, 0.38, GZ - 0.006],
  ];
  const grass = b.chain("grass", catmull(grassPts), { parent: "pelvis", count: 4, up: [0, 0, 1], twist: 70 });
  b.sweep(grass, (t) => [0.0065 * (1 - 0.45 * t), 0.0012] as const, {
    color: grassPaint,
    section: "box",
    caps: { start: "flat", end: "point" },
    name: "strand",
  });
  const blade = (pts: Array<[number, number, number]>, w: number) =>
    b.sweep(catmull(pts), (t) => [w * (1 - 0.5 * t), 0.0011] as const, {
      color: grassPaint,
      section: "box",
      up: [0, 0, 1],
      twist: 50,
      bone: "grass1",
      caps: { start: "flat", end: "point" },
    });
  blade(
    [
      [0.035, 0, -0.075],
      [0.04, 0.07, -0.075],
      [0.03, 0.15, -0.08],
      [0.022, 0.21, -0.085],
    ],
    0.0055,
  );
  blade(
    [
      [-0.04, 0, -0.035],
      [-0.05, 0.06, -0.035],
      [-0.058, 0.13, -0.04],
      [-0.07, 0.17, -0.045],
    ],
    0.005,
  );

  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.07, 0.007],
      [0.035, 0.014],
      [0, 0.016],
    ],
    { at: [0, 0, -0.04], color: "#e8d6a2", segments: 14, bone: "pelvis", name: "sand" },
  );
  const pebble = new THREE.SphereGeometry(1, 6, 5);
  b.part(pebble, "#c9b88c", { at: [0.06, 0.007, 0.0], scale: [0.011, 0.006, 0.008], bone: "pelvis" });
  b.part(pebble, "#b5a07a", { at: [-0.055, 0.007, 0.02], scale: [0.008, 0.005, 0.007], bone: "pelvis" });
  b.part(pebble, "#d8c9a0", { at: [0.03, 0.007, 0.045], scale: [0.006, 0.004, 0.005], bone: "pelvis" });

  return b.root;
}
```