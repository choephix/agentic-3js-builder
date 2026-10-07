```ts
import * as THREE from "three";
import { catmull, createBuilder, mottle, noise, paint, polyline, rng } from "agentic-3js-builder";

export const meta = {
  name: "Stag beetle on a mossy log",
  description:
    "A proud stag beetle with a glossy chestnut wing case, branched reddish jaws, elbowed feathery antennae, six spiny legs gripping a mossy log, and a dewdrop on one antler.",
};

const BLACK = "#16130f";
const JAW = "#7d3a1f";
const ANT = "#5a2d1a";
const LEG = "#1b1714";
const LIGHT = new THREE.Vector3(0.35, 0.85, 0.45).normalize();
const SHELL: [number, number, number] = [0.42, 0.14, 0.05];

// Chestnut wing case with a mirror-like glint where it faces the light.
const shell = paint((_p, n): [number, number, number] => {
  const d = Math.max(n.dot(LIGHT), 0);
  const glint = Math.pow(d, 28);
  const sheen = Math.pow(d, 4) * 0.12;
  const rim = 0.7 + 0.3 * Math.max(n.y, 0);
  return [
    Math.min(SHELL[0] * rim + glint * 0.85 + sheen, 1),
    Math.min(SHELL[1] * rim + glint * 0.8 + sheen, 1),
    Math.min(SHELL[2] * rim + glint * 0.7 + sheen, 1),
  ];
});

// Moss on the top of the log, bark on its flanks.
const moss = mottle("#6f9a34", "#3f6a22", { size: 0.025, seed: 3 });
const bark = mottle("#6b4a2c", "#3b2817", { size: 0.02, seed: 8 });
const logPaint = paint((p, n) =>
  n.y + (noise(p, 0.03, 5) - 0.5) * 0.7 > 0.3 ? moss.at(p, n) : bark.at(p, n),
);

// A dewdrop: pale glassy blue, bright on its upper face.
const DEW = paint((_p, n) => (n.y > 0.35 ? "#f4fcff" : "#8fd0ee"));

/** Height of the log's top surface at x (the log is an ellipse, radius 0.1 by 0.055, centred at y 0.055). */
const logTop = (x: number) => 0.055 + 0.055 * Math.sqrt(Math.max(0, 1 - (x / 0.1) ** 2));
const mid = (a: number[], c: number[]) => a.map((v, k) => (v + c[k]) / 2);

const b = createBuilder({ name: "stag beetle", paintSize: 1024 });

// Scenery: a half-buried log along Z, the root of the model.
b.joint("log", { at: [0, 0, 0] });
const logGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.24, 16);
logGeo.rotateX(Math.PI / 2);
logGeo.scale(1, 0.55, 1);
const logPart = b.part(logGeo, logPaint, { at: [0, 0.055, 0], bone: "log", name: "log" });

// The beetle's body.
b.joint("body", { parent: "log", at: [0, 0.16, 0], dir: [0, 0, 1] });
b.joint("head", { parent: "body", at: [0, 0.158, 0.03], dir: [0, 0, 1], role: "head" });

b.part(new THREE.SphereGeometry(1, 14, 10), BLACK, {
  at: [0, 0.16, 0.006],
  scale: [0.0135, 0.0115, 0.0135],
  bone: "body",
  name: "thorax",
});
b.part(new THREE.SphereGeometry(1, 14, 10), BLACK, {
  at: [0, 0.158, 0.03],
  scale: [0.0105, 0.0095, 0.0095],
  bone: "head",
  name: "head",
});
for (const s of [1, -1]) {
  const S = s > 0 ? "L" : "R";
  b.part(new THREE.SphereGeometry(0.28, 8, 6), "#0d0b0a", {
    at: [s * 0.0088, 0.161, 0.036],
    bone: "head",
    name: `eye${S}`,
  });
}

// Wing cases: glossy chestnut domes covering the abdomen.
for (const s of [1, -1]) {
  b.part(new THREE.SphereGeometry(1, 16, 10), shell, {
    at: [s * 0.0095, 0.163, -0.012],
    scale: [0.0105, 0.0105, 0.0265],
    bone: "body",
    name: s > 0 ? "elytraL" : "elytraR",
  });
}

// Branched jaws: a long curved mandible, a branch tooth on the outside and an inner tooth near the base.
for (const s of [1, -1]) {
  const S = s > 0 ? "L" : "R";
  b.joint(`jaw${S}`, { parent: "head", at: [s * 0.005, 0.162, 0.034], dir: [s * 0.3, 0, 1], role: "jaw" });
  b.sweep(
    catmull([
      [s * 0.006, 0.163, 0.034],
      [s * 0.012, 0.166, 0.052],
      [s * 0.0105, 0.165, 0.066],
      [s * 0.003, 0.161, 0.076],
    ]),
    [0.0045, 0.0013],
    { color: JAW, bone: `jaw${S}`, name: `mandible${S}` },
  );
  b.spike([s * 0.0115, 0.1655, 0.058], [-s * 0.3, 1, 0.2], 0.009, 0.0022, {
    color: JAW,
    bone: `jaw${S}`,
    name: `branch${S}`,
  });
  b.spike([s * 0.008, 0.163, 0.046], [-s * 0.6, 0.5, 1], 0.006, 0.0016, {
    color: JAW,
    bone: `jaw${S}`,
    name: `tooth${S}`,
  });
}

// The dewdrop clings to the tip of the left branch tooth.
b.part(new THREE.SphereGeometry(1, 10, 7), DEW, {
  at: [0.0092, 0.1725, 0.0597],
  scale: 0.0042,
  bone: "jawL",
  name: "dewdrop",
});

// Elbowed antennae with a feathery club at the tip.
for (const s of [1, -1]) {
  const S = s > 0 ? "L" : "R";
  const pts = [
    [s * 0.004, 0.168, 0.036],
    [s * 0.009, 0.187, 0.04],
    [s * 0.017, 0.193, 0.052],
    [s * 0.026, 0.181, 0.07],
  ];
  b.chain(`ant${S}`, polyline(pts), {
    parent: "head",
    role: "tentacle",
    names: [`antA${S}`, `antB${S}`, `antC${S}`, `antTip${S}`],
  });
  b.sweep(`ant${S}` && polyline(pts), [0.0013, 0.0009, 0.0008, 0.0006], {
    color: ANT,
    name: `antenna${S}`,
  });
  const tip = pts[3];
  const fan = [
    [0.8, 0.5, 0.1],
    [0.9, 0.1, 0.2],
    [0.6, -0.3, 0.4],
    [0.5, 0.6, -0.3],
    [0.9, -0.1, -0.2],
  ];
  for (const d of fan) {
    const dir = [d[0] * s, d[1], d[2]];
    const len = Math.hypot(dir[0], dir[1], dir[2]);
    const end = tip.map((v, k) => v + (dir[k] / len) * 0.011);
    b.rod(tip, end, [0.0012, 0.0005], { color: ANT, bone: `antTip${S}`, name: `feather${S}` });
  }
}

// Six spiny legs: three pairs, each a hip, knee and ankle chain ending on the log.
for (const [S, s] of [
  ["L", 1],
  ["R", -1],
] as const) {
  for (const [i, z] of [
    [1, 0.018],
    [2, 0.002],
    [3, -0.014],
  ] as const) {
    const hip = [s * 0.0095, 0.158, z];
    const knee = [s * 0.034, 0.141, z + 0.003];
    const ankle = [s * 0.05, 0.117, z - 0.001];
    const tipX = 0.058;
    const tip = [s * tipX, logTop(tipX) + 0.0008, z - 0.002];
    b.chain(`leg${S}${i}`, polyline([hip, knee, ankle, tip]), {
      parent: "body",
      role: "leg",
      names: [`hip${S}${i}`, `knee${S}${i}`, `ankle${S}${i}`],
    });
    b.sweep(`leg${S}${i}` && polyline([hip, knee, ankle, tip]), [0.0028, 0.0018, 0.0011], {
      color: LEG,
      name: `leg${S}${i}`,
    });
    // Spines along the femur and tibia, pointing back and out.
    b.spike(mid(hip, knee), [s * 0.6, 0.35, -0.7], 0.0075, 0.0013, {
      color: LEG,
      bone: `hip${S}${i}`,
      name: `spineF${S}${i}`,
    });
    b.spike(mid(knee, ankle), [s * 0.4, 0.2, -0.8], 0.0065, 0.0013, {
      color: LEG,
      bone: `knee${S}${i}`,
      name: `spineT${S}${i}`,
    });
    // A small claw at the foot.
    b.spike(tip, [s * 0.3, -1, 0], 0.003, 0.0008, {
      color: LEG,
      bone: `ankle${S}${i}`,
      name: `claw${S}${i}`,
    });
  }
}

// Moss clumps scattered over the log top, kept out from under the beetle.
const random = rng(7);
const clumps = b.surface(logPart).scatter(40, {
  rng: random,
  minDist: 0.022,
  filter: (hit) => hit.n.y > 0.7,
  keepOut: (p) => p.z > -0.05 && p.z < 0.08 && Math.abs(p.x) < 0.07,
});
clumps.forEach((hit, k) => {
  const size = 0.7 + 0.6 * random();
  const geo = new THREE.SphereGeometry(1, 8, 5);
  geo.scale(0.018 * size, 0.009 * size, 0.018 * size);
  b.stick(geo, k % 3 === 0 ? "#7aa53a" : "#5f8a2c", hit, { embed: 0.35, name: `moss${k}` });
});

export default function build() {
  return b.root;
}
```